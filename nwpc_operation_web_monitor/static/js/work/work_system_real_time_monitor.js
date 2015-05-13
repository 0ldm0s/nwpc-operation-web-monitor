/**
 * For work_system_real_time_monitor.html
 */


var socket = io.connect('http://127.0.0.1:5101/hpc');
$(document).ready(function () {
    var llq_type_chart_svg_attr = {
        height:180, //$('#llq_total_job_board').height(),
        width: $('#llq_type_chart_board').width()
    };
    var llq_type_chart_label_width = 120;
    var margin = 10;
    var llq_type_chart_attr = {
        max_width: llq_type_chart_svg_attr.width - llq_type_chart_label_width - margin,
        bar_height: 20,
        bar_step: 30
    };
    var llq_type_chart_svg = d3.select('#llq_type_chart_board').append('svg')
        .attr('id', 'llq_type_chart')
        .attr('height', llq_type_chart_svg_attr.height)
        .attr('width', llq_type_chart_svg_attr.width);
    var llq_type_chart_bar_group = llq_type_chart_svg;
    var llq_type_chart_label_group = llq_type_chart_svg;

    var llq_info = [
        {name: 'total', value: 0},
        {name: 'waiting', value: 0},
        {name: 'pending', value: 0},
        {name: 'running', value: 0},
        {name: 'held', value: 0},
        {name: 'preempted', value: 0}
    ];

    var bar_chart_label_data = llq_type_chart_label_group.selectAll('.llq-type-label').data(llq_info);
    var bar_chart_label_enter = bar_chart_label_data
        .enter()
        .append('text')
        .attr('x', llq_type_chart_label_width - margin)
        .attr('y', function(d,i){
            return i*llq_type_chart_attr.bar_step + llq_type_chart_attr.bar_height;
        })
        .attr('text-anchor', 'end')
        .style('font-size', llq_type_chart_attr.bar_height)
        .text(function(d){ return d.name; });



    function update_llq_type_chart(llq_message){
        var max_number = d3.max(llq_message, function(d){ return d.value; });
        var x_scale = d3.scale.linear().domain([0, max_number]).range([0, llq_type_chart_attr.max_width]);
        var bar_chart_data = llq_type_chart_bar_group.selectAll('.llq-type-bar').data(llq_message);
        var bar_chart_data_enter = bar_chart_data
            .enter()
            .append('rect')
            .attr('class', 'llq-type-bar')
            .attr('height', llq_type_chart_attr.bar_height)
            .attr('width', function(d){
                return x_scale(d.value);
            })
            .attr('x', llq_type_chart_label_width)
            .attr('y', function(d,i){
                return i*llq_type_chart_attr.bar_step;
            })
            .attr('fill', '#ddd');

        var bar_chart_data_modify = bar_chart_data
            .transition()
            .duration(800)
            .attr('width', function(d){
                return x_scale(d.value);
            });
    }



    socket.on('connect', function() {
        console.log('I\'m connected!');
    });
    socket.on('send_llq_info', function(msg){
        console.log('send_llq_info in global');
        var total = parseInt(msg.in_queue);
        var waiting = parseInt(msg.waiting);
        var held = parseInt(msg.held);
        var running = parseInt(msg.running);
        var pending = parseInt(msg.pending);
        var preempted = parseInt(msg.preempted);

        var llq_info = [
            {name: 'total', value: total},
            {name: 'waiting', value: waiting},
            {name: 'pending', value: pending},
            {name: 'running', value: running},
            {name: 'held', value: held},
            {name: 'preempted', value: preempted}
        ];
        update_llq_type_chart(llq_info);

        //$('#total_llq_job_number').html(total);
        $('#waiting_llq_job_number').html(waiting);
        $('#held_llq_job_number').html(held);
        $('#running_llq_job_number').html(running);
        $('#pending_llq_job_number').html(pending);
        $('#preempted_llq_job_number').html(preempted);
    });

    socket.on("llq_detail_info", function(message){
        console.log(message);
    });

    $("#user_llq_query_button").click(function(){
        var message={
            app:'npwc_operation_web_monitor',
            data:{
                query_user: 'nwp_qu'
            }
        };
        socket.emit('llq_detail_info', message);
    });
});


var LoadlevelerTotalJobBoard = React.createClass({
    getInitialState: function() {
        return {total_job_number: 'Unknown'};
    },
    componentDidMount: function(){
        var component = this;
        socket.on('send_llq_info', function(msg){
            console.log('send_llq_info in component');
            var total = parseInt(msg.in_queue);
            var waiting = parseInt(msg.waiting);
            var held = parseInt(msg.held);
            var running = parseInt(msg.running);
            var pending = parseInt(msg.pending);
            var preempted = parseInt(msg.preempted);
            component.setState({
                total_job_number: total
            });
        });
    },
    render: function(){
        return (
            <div className="loadlevelerTotalJobBoard">
                <div id="total_llq_job_number">{this.state.total_job_number}</div>
                <div className="main_board_subtitle">job step(s) in loadleveler queue</div>
            </div>
        )
    }
});

React.render(
    <LoadlevelerTotalJobBoard />,
    document.getElementById('llq_total_job_board')
);